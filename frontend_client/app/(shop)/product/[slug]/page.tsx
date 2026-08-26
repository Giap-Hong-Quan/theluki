import React from 'react'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Danh sách sản phẩm theo danh mục: {slug}</h1>
      {/* Fetch và hiển thị danh sách sản phẩm theo category slug */}
    </div>
  )
}

export default ProductPage