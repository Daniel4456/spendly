import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { TransactionModal } from '../transactions/TransactionModal';
import { useTransactions } from '../../context/TransactionContext';
import { useToast } from '../../context/ToastContext';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { addTransaction } = useTransactions();
  const { showToast } = useToast();

  const handleSaveTransaction = async (data: any) => {
    await addTransaction(data);
    showToast('Transaction added successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-background-dark dark:bg-background-dark light:bg-background-light text-text-primary dark:text-text-primary light:text-text-light-primary flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Center Layout: Sidebar + Main Content */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar for desktop / tablet */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full pb-28 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (screens < 768px) */}
      <MobileNavigation onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};
