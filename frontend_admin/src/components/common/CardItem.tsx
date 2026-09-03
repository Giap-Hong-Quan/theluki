import { Card } from 'antd';
interface CardItemProps{
  title: string;
  number: string;
  description: string;
}
const CardItem = ({title,number,description}:CardItemProps) => {
  return (
    <Card className='!rounded-none w-full !border-0 !border-r-[0.1px] !border-gray-300'>
         <p className='text-lg'>{title}</p>
         <p className='text-3xl font-bold'>{number}</p>
         <p className='text-[#C55462]'>{description}</p>
    </Card>
  )
}

export default CardItem