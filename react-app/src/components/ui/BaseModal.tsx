import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react'

interface BaseModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'large'
}

export function BaseModal({ open, onClose, title, children, size = 'lg' }: BaseModalProps) {
  // Map 'large' to NextUI size
  const modalSize = size === 'large' ? 'xl' : size

  return (
    <>
      {/* Кастомные стили для скроллбара */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .modal-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4a4a4a #2a2a2a;
          }
          
          .modal-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .modal-scrollbar::-webkit-scrollbar-track {
            background: #2a2a2a;
            border-radius: 10px;
          }
          
          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: #4a4a4a;
            border-radius: 10px;
          }
          
          .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #85DCCB;
          }
        `
      }} />
      
      <Modal 
        isOpen={open} 
        onClose={onClose}
        size={modalSize}
        placement="center"
        backdrop="opaque"
        scrollBehavior="inside"
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        radius="lg"
        classNames={{
          backdrop: "bg-black/80",
          wrapper: "p-6 flex items-center justify-center",
          base: "bg-gray-800 border border-gray-600 max-h-[85vh] max-w-[85vw] w-full rounded-lg overflow-hidden",
          header: "border-b border-gray-600 flex-shrink-0 bg-gray-800 px-6 py-4 rounded-t-lg",
          body: "py-6 px-6 overflow-y-auto modal-scrollbar bg-gray-800",
          closeButton: "hover:bg-gray-600 text-gray-300 hover:text-white transition-colors z-50"
        }}
      >
        <ModalContent className="rounded-lg overflow-hidden">
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </ModalHeader>
          <ModalBody>
            {children}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
