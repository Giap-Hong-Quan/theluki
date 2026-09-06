import toast from "react-hot-toast";

async function copyToClipboard(text: string, message = "Đã sao chép vào clipboard!") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch (err) {
    console.error("Lỗi sao chép:", err);
    toast.error("Không thể sao chép");
  }
}

export default copyToClipboard;
