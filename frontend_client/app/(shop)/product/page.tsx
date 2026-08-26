import Breadcrumb from "@/components/layouts/Breadcrumb";

const product = () => {
  return (
    <div>
      <Breadcrumb
        items={[
          {
            label: "Trang chủ",
            href: "/",
          },
          {
            label: "Sản phẩm",
          },
        ]}
      />
      <h1 className="text-3xl font-bold text-center">Sản phẩm</h1>
    </div>
  );
};

export default product;