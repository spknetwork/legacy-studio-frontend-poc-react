import React, { useState } from "react";

import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

import hive from "@hiveio/hive-js";

axios.defaults.headers.post["Access-Control-Allow-Origin"] = "*";
const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

// const studioEndPoint = "https://studio.3speak.tv";
const studioEndPoint = "http://localhost:13050";

function App() {
  const [username, setUsername] = useState("");
  const [postingKey, setPostingKey] = useState("");

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePostingKeyChange(event) {
    setPostingKey(event.target.value);
  }

  async function logMe() {
    try {
      let response = await client.get(
        `${studioEndPoint}/mobile/login?username=${username}`,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Response: ${JSON.stringify(response)}`);
      const memo = response.data.memo;
      console.log(`Memo - ${response.data.memo}`);
      let access_token = hive.memo.decode(postingKey, memo);
      access_token = access_token.replace("#", "");
      console.log(`Decrypted ${access_token}\n\n`);
      const user = await getTokenValidated(access_token);
      console.log(`User is ${JSON.stringify(user)}`);
      const allVideos = await getAllVideoStatuses(access_token);
      console.log(`videos are is ${JSON.stringify(allVideos)})}`);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async function getAllVideoStatuses(access_token) {
    try {
      let response = await client.get(
        `${studioEndPoint}/mobile/api/my-videos`,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
          },
        }
      );
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async function getTokenValidated(jwt) {
    try {
      let response = await client.get(
        `${studioEndPoint}/mobile/login?username=${username}&access_token=${jwt}`,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.headers);
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  return (
    <div className="App">
      <div>
        <label>Username: </label>
        <input type="text" onChange={handleUsernameChange} value={username} />
      </div>
      <div>
        <label>Posting Key: </label>
        <input
          type="password"
          onChange={handlePostingKeyChange}
          value={postingKey}
        />
      </div>

      <div>
        <button onClick={logMe}>Login</button>
      </div>
    </div>
  );
}

export default App;
