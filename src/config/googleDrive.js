import axios from "axios";

const API_KEY = "AIzaSyBQyrQ7B9pgfT_G6FWXmGGF3WJflROQwCU";

const BASE_FOLDER_ID = "1cwwu2BS-mzyjCf9EpIshCjlxpAX4nKOX";

const BASE_URL = "https://www.googleapis.com/drive/v3";

export async function getDriveItems(folderId, pageToken = null) {
  try {
    const params = {
      q: `'${folderId}' in parents`,
      key: API_KEY,
      fields: "nextPageToken, files(id, name, mimeType, webContentLink)",
      pageSize: 1000,
    };
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await axios.get(`${BASE_URL}/files`, { params });
    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error("Error fetching Google Drive items:", error);
    return { files: [], nextPageToken: null };
  }
}

export async function getTopLevelItems() {
  const { files } = await getDriveItems(BASE_FOLDER_ID, null);
  return files;
}
