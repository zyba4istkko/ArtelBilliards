import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react'
import tokens from '../../styles/design-tokens'

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
            scrollbar-color: ${tokens.colors.gray500} ${tokens.colors.gray700};
          }
          
          .modal-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .modal-scrollbar::-webkit-scrollbar-track {
            background: ${tokens.colors.gray700};
            border-radius: 10px;
          }
          
          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: ${tokens.colors.gray500};
            border-radius: 10px;
          }
          
          .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${tokens.colors.mint};
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
          base: "max-h-[85vh] max-w-[85vw] w-full rounded-lg overflow-hidden",
          header: "flex-shrink-0 px-6 py-4 rounded-t-lg",
          body: "py-6 px-6 overflow-y-auto custom-scrollbar",
          closeButton: "transition-colors z-50"
        }}
      >
        <ModalContent className="rounded-lg overflow-hidden" style={{
          backgroundColor: tokens.colors.gray800,
          border: `1px solid ${tokens.colors.gray600}`
        }}>
          <ModalHeader className="flex flex-col gap-1" style={{
            backgroundColor: tokens.colors.gray800,
            borderBottom: `1px solid ${tokens.colors.gray600}`
          }}>
            <h2 style={{ color: tokens.colors.white }} className="text-xl font-bold">{title}</h2>
          </ModalHeader>
          <ModalBody style={{ backgroundColor: tokens.colors.gray800 }}>
            {children}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
