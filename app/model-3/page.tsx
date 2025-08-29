// app/model-3/page.tsx
import TeslaModelProductPage from "../components/TeslaModelProductPage";

export const metadata = {
  title: "Tesla Model 3 Parts & Accessories | TheEVStore",
  description: "Premium Tesla Model 3 parts, components, and accessories for 2017-2025 models. OEM quality with professional installation support.",
};

export default function Model3Page() {
  return <TeslaModelProductPage modelType="MODEL_3" />;
}