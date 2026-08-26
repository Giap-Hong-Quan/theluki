import React from 'react'

interface CollectionDetailPageProps {
  params: Promise<{ slug: string }> // Với Next.js 15 (nếu Next.js 14 trở xuống thì params: { slug: string })
}

const CollectionDetailPage = async ({ params }: CollectionDetailPageProps) => {
  const { slug } = await params

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Chi tiết bộ sưu tập: {slug}</h1>
      {/* Fetch và hiển thị danh sách sản phẩm thuộc collection này */}
    </div>
  )
}

export default CollectionDetailPage
