import {
  createBrowserRouter,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div className="text-2xl">Hello world!</div>,
  },
]);

export default router;