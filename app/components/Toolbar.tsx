import { Calculator, PlusCircle, Edit2, Trash2, RectangleVertical,} from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

export const Toolbar = ({ onDelete, onEdit, canDelete, canEdit }: { onDelete: () => void, onEdit: () => void, canDelete: boolean, canEdit: boolean}) => {

  return (
    <div className="flex justify-between pr-3 bg-white sticky top-0 z-10">
      <Link href="/configuration/pile" prefetch={null}>
        <Button variant="ghost" className="hover:bg-purple-100">
          <RectangleVertical className="h-5 w-5 text-purple-500" />
          <span className='font-bold'>Helical Pile</span>
        </Button>
      </Link>

      <div className="space-x-3">
        <Link href="/configuration/calculate-soil" prefetch={null}>
          <Button variant="ghost" className="hover:bg-green-100">
            <Calculator className="h-5 w-5 text-green-700" />
            Calculate
          </Button>
        </Link>

        <Link href="/configuration/insert-soil" prefetch={null}>
          <Button variant="ghost" className="hover:bg-blue-100">
            <PlusCircle className="h-5 w-5 text-blue-500" />
            Insert
          </Button>
        </Link>

        <Button 
          variant="ghost" 
          className={`hover:bg-gray-100 ${!canEdit && 'opacity-50 cursor-not-allowed'}`}
          onClick={onEdit}
          disabled={!canEdit}
        >
          <Edit2 className="h-5 w-5 text-gray-500" />
          Edit
        </Button>

        <Button 
          variant="ghost" 
          className={`hover:bg-red-100 ${!canDelete && 'opacity-50 cursor-not-allowed'}`}
          onClick={onDelete}
          disabled={!canDelete}
        >
          <Trash2 className="h-5 w-5 text-red-500" />
          Delete
        </Button>
      </div>
    </div>
  )
}

