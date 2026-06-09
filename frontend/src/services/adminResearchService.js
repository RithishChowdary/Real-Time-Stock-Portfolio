import axiosClient from "../api/axiosClient";

export async function uploadResearch(data, pdf) {

  console.log("DATA =", data);
  console.log("PDF =", pdf);

  const formData = new FormData();

  formData.append(
    "data",
    new Blob(
      [JSON.stringify(data)],
      {
        type: "application/json"
      }
    )
  );

  formData.append("pdf", pdf);

  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const response = await axiosClient.post(
    "/research",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
}