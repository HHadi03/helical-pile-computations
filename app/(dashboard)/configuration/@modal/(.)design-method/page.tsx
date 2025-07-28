import { Modal } from '@/components/Modal'
import { InsertDesignMethodForm } from "../../design-method/InsertDesignMethodForm"
import { createClient } from "@/utils/supabase/server"

export default async function DesignMethodModal() {

  const supabase = await createClient()
  const { data: designMethodData, error: designMethodDataError } = await supabase
  .from('design_methods')
  .select("*")
  .single()
  
  if (!designMethodData) {
    return (
      <Modal title="Determine Design Method">
        <InsertDesignMethodForm/>
      </Modal>
    )
  }

  else if (designMethodDataError) {
    return (
      <Modal title="Error - Determine Design Method">
        <div className="text-destructive text-sm flex justify-center">
          <p>Could not find design method data</p>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal title="Determine Design Method">
      <div className="px-4">
        *Edit Design Method Form*
      </div>
    </Modal>
  )
}
