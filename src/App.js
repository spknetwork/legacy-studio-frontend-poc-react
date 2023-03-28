import React, { useState } from "react";
import axios from "axios";
import * as tus from "tus-js-client";
import hive from "@hiveio/hive-js";

const client = axios.create({});

const studioEndPoint = "https://studio.3speak.tv";
const tusEndPoint = "https://uploads.3speak.tv/files/";
// const studioEndPoint = "http://localhost:13050";
// const tusEndPoint = "http://0.0.0.0:1080/files/";

function App() {
  const [username, setUsername] = useState("");
  const [postingKey, setPostingKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbUrl, setThumbUrl] = useState("");

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePostingKeyChange(event) {
    setPostingKey(event.target.value);
  }

  function handleVideoUrlChange(event) {
    setVideoUrl(event.target.value);
  }

  function handleThumbUrlChange(event) {
    setThumbUrl(event.target.value);
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
      setAccessToken(access_token);
      console.log(`User is ${JSON.stringify(user)}`);
      const allVideos = await getAllVideoStatuses(access_token);
      console.log(`videos are is ${JSON.stringify(allVideos)})}`);

      // Step 3. Upload video
      // const videoUpload = await startUpload("test-demo-video.mp4", tusEndPoint);
      // const videoUploadFileUrl = videoUpload.replace(`${tusEndPoint}`, "");
      // console.log(`Video File Url ${videoUploadFileUrl}\n\n`);

      // // Step 4. Upload Thumb
      // const thumbUpload = await startUpload("test-demo-thumb.png", tusEndPoint);
      // const thumbUploadFileUrl = thumbUpload.replace(`${tusEndPoint}`, "");
      // console.log(`Thumb File ID ${thumbUploadFileUrl}\n\n`);

      // Step 5. Update Video upload information
      // const data = await updateVideoInfo(
      //   "test-demo-video.mp4",
      //   'bf7e91fc6ac176750a7e9ecd5e7d9413',
      // );
      // console.log(`Video upload response: ${JSON.stringify(data)}`);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async function uploadInfo() {
    const data = await updateVideoInfo("test-demo-video.mp4",videoUrl, thumbUrl);
    console.log(`Video upload response: ${JSON.stringify(data)}`);
  }

  async function getAllVideoStatuses(access_token) {
    try {
      let response = await client.get(
        `${studioEndPoint}/mobile/api/my-videos`,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
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
      setAccessToken(jwt);
      return response.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async function updateVideoInfo(
    oFilename,
    videoUrl,
    thumbnailUrl,
  ) {
    try {
      const { data } = await axios.post(
        `${studioEndPoint}/mobile/api/upload_info`,
        {
          filename: videoUrl,
          oFilename: oFilename,
          size: 9609313, // NOTE: please change this constant value. This is POC app. It has to be in bytes.
          duration: 40, // NOTE: please change this constant value. This is POC app. it has to be in seconds.
          thumbnail: thumbnailUrl, // NOTE: please change this constant value. This is POC app. It
          owner: username,
          isReel: false, // if video is a reel/short (Three Shorts) send this as true
        },
        {
          withCredentials: false,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      );
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  function onChange(event) {
    var file = event.target.files[0];
    console.log(file);
    var upload = new tus.Upload(file, {
      // Endpoint is the upload creation URL from your tus server
      endpoint: tusEndPoint,
      // Retry delays will enable tus-js-client to automatically retry on errors
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // Attach additional meta data about the file for the server
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      // Callback for errors which cannot be fixed using retries
      onError: function (error) {
        console.log("Failed because: " + error);
      },
      // Callback for reporting upload progress
      onProgress: function (bytesUploaded, bytesTotal) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      // Callback for once the upload is completed
      onSuccess: function () {
        console.log("File %s", upload.file.name);
        console.log("URL %s", upload.url.replace(tusEndPoint, ""));
      },
    });
    upload.start();
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

      <input type="file" onChange={onChange} />

      <div>
        <label>Video URL: </label>
        <input type="text" onChange={handleVideoUrlChange} value={videoUrl} />
      </div>

      <div>
        <label>Thumb URL: </label>
        <input type="text" onChange={handleThumbUrlChange} value={thumbUrl} />
      </div>

      <div>
        <button onClick={uploadInfo}>Upload Info</button>
      </div>
    </div>
  );
}

export default App;
