export const isValidImageUrl = async (url) => {
  try {
    const parsedUrl = new URL(url);
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    // Check if the URL ends with a valid image extension
    if (validExtensions.some((ext) => parsedUrl.pathname.endsWith(ext))) {
      return true;
    }

    // Make a HEAD request to check content type
    const response = await axios.head(url);
    const contentType = response.headers["content-type"];

    return contentType.startsWith("image/");
  } catch (error) {
    return false;
  }
};
