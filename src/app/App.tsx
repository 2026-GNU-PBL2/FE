import QueryProvider from "./providers/QueryProvider";
import RouterProvider from "./providers/RouterProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <QueryProvider>
      <>
        <RouterProvider />
        <ToastContainer
          position="bottom-right"
          autoClose={2200}
          hideProgressBar
          closeOnClick
          pauseOnHover
          newestOnTop
          draggable={false}
          theme="light"
        />
      </>
    </QueryProvider>
  );
}
