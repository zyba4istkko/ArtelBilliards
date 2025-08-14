import React, { useState } from 'react'
import { Card, CardBody, Button } from '@nextui-org/react'
import { Plus } from 'lucide-react'
import { BaseModal } from './BaseModal'
import { CreateTemplateForm } from './CreateTemplateForm'
import { apiClient } from '../../api/client'
import type { GameTemplateCreate } from '../../api/types'

interface CreateTemplateCardProps {
  onTemplateCreated: () => void
}

export function CreateTemplateCard({ onTemplateCreated }: CreateTemplateCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmitTemplate = async (template: GameTemplateCreate) => {
    try {
      await apiClient.post('/api/v1/templates/', template)
      onTemplateCreated()
      handleCloseModal()
    } catch (error) {
      console.error('Ошибка создания шаблона:', error)
      throw error
    }
  }

  return (
    <>
      <Card className="h-full border-2 border-dashed border-gray-600 bg-gray-900 hover:border-coral hover:bg-gray-800 transition-all duration-300 hover:shadow-lg">
        <CardBody className="flex flex-col items-center justify-center text-center p-8 min-h-[320px]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coral to-peach flex items-center justify-center mb-6 transition-transform hover:scale-110">
            <Plus size={32} className="text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-3">
            Создать свой шаблон
          </h3>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            Настрой правила под себя: количество игроков, стоимость, штрафы и другое
          </p>
          
          <Button
            className="text-white font-semibold px-6 py-2 rounded-xl transition-colors"
            style={{ backgroundColor: '#E27D60' }}
            variant="solid"
            onPress={handleOpenModal}
          >
            Настроить правила
          </Button>
        </CardBody>
      </Card>

      <BaseModal
        open={isModalOpen}
        onClose={handleCloseModal}
        title="Создать свой шаблон"
        size="xl"
      >
        <CreateTemplateForm
          onClose={handleCloseModal}
          onSubmit={handleSubmitTemplate}
        />
      </BaseModal>
    </>
  )
}
