import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react'

interface EndGameModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
}

export default function EndGameModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Завершить игру?",
  message = "Игра будет завершена и результаты сохранены. Вы вернетесь к обзору сессии."
}: EndGameModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      classNames={{
        base: "bg-gray-800 border border-gray-600",
        header: "border-b border-gray-600",
        body: "py-6",
        footer: "border-t border-gray-600"
      }}
    >
      <ModalContent>
        <ModalHeader>
          <h3 className="text-xl font-bold text-white">
            {title}
          </h3>
        </ModalHeader>

        <ModalBody>
          <p className="text-gray-300 text-center">
            {message}
          </p>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="bordered"
            className="border-gray-600 text-white hover:bg-gray-700"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            color="danger"
            className="font-bold"
            onClick={onConfirm}
          >
            Завершить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
