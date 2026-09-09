import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import type { FormSchema, LogicRule } from '../types/schema'

interface LogicDialogProps {
  isOpen: boolean
  onClose: () => void
  schema: FormSchema
  onUpdateLogic: (logic: LogicRule[]) => void
}

export function LogicDialog({ isOpen, onClose, schema, onUpdateLogic }: LogicDialogProps) {
  const [logic, setLogic] = useState<LogicRule[]>(schema.logic || [])

  // Flatten all fields to choose from
  const allFields = schema.sections.flatMap(s => s.fields)

  const handleSave = () => {
    onUpdateLogic(logic)
    onClose()
  }

  const addRule = () => {
    setLogic([...logic, {
      id: `rule_${Date.now()}`,
      conditionOperator: 'ALL',
      conditions: [{ fieldId: '', operator: 'equals', value: '' }],
      actions: [{ type: 'SHOW', fieldId: '' }]
    }])
  }

  const updateRule = (index: number, updates: Partial<LogicRule>) => {
    const newLogic = [...logic]
    newLogic[index] = { ...newLogic[index], ...updates }
    setLogic(newLogic)
  }

  const removeRule = (index: number) => {
    setLogic(logic.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <DialogTitle>Form Logic Rules</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
          {logic.map((rule, rIdx) => (
            <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4 relative">
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeRule(rIdx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Conditions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  IF
                  <select 
                    className="text-xs border-gray-300 rounded p-1" 
                    value={rule.conditionOperator}
                    onChange={e => updateRule(rIdx, { conditionOperator: e.target.value as any })}
                  >
                    <option value="ALL">ALL of these conditions are met</option>
                    <option value="ANY">ANY of these conditions are met</option>
                  </select>
                </h4>
                <div className="space-y-2">
                  {rule.conditions.map((cond, cIdx) => (
                    <div key={cIdx} className="flex gap-2 items-center">
                      <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
                        value={cond.fieldId} onChange={e => {
                          const newC = [...rule.conditions]; newC[cIdx].fieldId = e.target.value; updateRule(rIdx, { conditions: newC })
                        }}>
                        <option value="">Select Field...</option>
                        {allFields.map(f => <option key={f.id} value={f.id}>{f.label || f.name}</option>)}
                      </select>
                      
                      <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
                        value={cond.operator} onChange={e => {
                          const newC = [...rule.conditions]; newC[cIdx].operator = e.target.value as any; updateRule(rIdx, { conditions: newC })
                        }}>
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not equals</option>
                        <option value="contains">Contains</option>
                        <option value="greater_than">Greater than</option>
                        <option value="less_than">Less than</option>
                        <option value="is_empty">Is empty</option>
                        <option value="is_not_empty">Is not empty</option>
                      </select>

                      <Input className="w-48" value={cond.value as string || ''} placeholder="Value" 
                        onChange={e => {
                          const newC = [...rule.conditions]; newC[cIdx].value = e.target.value; updateRule(rIdx, { conditions: newC })
                        }} />
                      
                      <Button variant="ghost" size="icon" onClick={() => {
                        const newC = rule.conditions.filter((_, i) => i !== cIdx)
                        updateRule(rIdx, { conditions: newC })
                      }}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" className="text-blue-600 -ml-2 text-xs" 
                    onClick={() => updateRule(rIdx, { conditions: [...rule.conditions, { fieldId: '', operator: 'equals', value: '' }] })}>
                    <Plus className="w-3 h-3 mr-1" /> Add Condition
                  </Button>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-4" />

              {/* Actions */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">THEN</h4>
                <div className="space-y-2">
                  {rule.actions.map((act, aIdx) => (
                    <div key={aIdx} className="flex gap-2 items-center">
                      <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-36"
                        value={act.type} onChange={e => {
                          const newA = [...rule.actions]; newA[aIdx].type = e.target.value as any; updateRule(rIdx, { actions: newA })
                        }}>
                        <option value="SHOW">Show</option>
                        <option value="HIDE">Hide</option>
                        <option value="ENABLE">Enable</option>
                        <option value="DISABLE">Disable</option>
                        <option value="REQUIRE">Require</option>
                        <option value="SET_VALUE">Set Value</option>
                      </select>

                      <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-48"
                        value={act.fieldId} onChange={e => {
                          const newA = [...rule.actions]; newA[aIdx].fieldId = e.target.value; updateRule(rIdx, { actions: newA })
                        }}>
                        <option value="">Select Field...</option>
                        {allFields.map(f => <option key={f.id} value={f.id}>{f.label || f.name}</option>)}
                      </select>

                      {act.type === 'SET_VALUE' && (
                        <Input className="w-48" value={act.value as string || ''} placeholder="Value" 
                          onChange={e => {
                            const newA = [...rule.actions]; newA[aIdx].value = e.target.value; updateRule(rIdx, { actions: newA })
                          }} />
                      )}

                      <Button variant="ghost" size="icon" onClick={() => {
                        const newA = rule.actions.filter((_, i) => i !== aIdx)
                        updateRule(rIdx, { actions: newA })
                      }}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" className="text-blue-600 -ml-2 text-xs" 
                    onClick={() => updateRule(rIdx, { actions: [...rule.actions, { type: 'SHOW', fieldId: '' }] })}>
                    <Plus className="w-3 h-3 mr-1" /> Add Action
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {logic.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No logic rules configured yet.
            </div>
          )}
          
          <Button type="button" variant="outline" className="w-full border-dashed" onClick={addRule}>
            <Plus className="w-4 h-4 mr-2" /> Create New Rule
          </Button>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Rules</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}