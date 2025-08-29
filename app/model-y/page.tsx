// app/model-y/page.tsx
import TeslaModelProductPage from "../components/TeslaModelProductPage";

export const metadata = {
  title: "Tesla Model Y Parts & Accessories | TheEVStore",
  description: "Premium Tesla Model Y parts, components, and accessories for 2020-2025 models. Seven-seat compatible with towing support.",
};

export default function ModelYPage() {
  return <TeslaModelProductPage modelType="MODEL_Y" />;
}