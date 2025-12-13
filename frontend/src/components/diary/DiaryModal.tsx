import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import DiaryCreate from './DiaryCreate';
import DiaryRead from './DiaryRead';
import DiaryEdit from './DiaryEdit';
import { baseballApi } from '../../api/baseballApi';
import { formatDate } from '../../utils/dateUtils';
import type { Diary } from '../../types/Diary';

interface DiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
}

type DiaryMode = 'create' | 'read' | 'edit';

const DiaryModal: React.FC<DiaryModalProps> = ({ isOpen, onClose, selectedDate }) => {
    const [mode, setMode] = useState<DiaryMode>('create');
    const [diaryData, setDiaryData] = useState<Diary | null>(null);

    useEffect(() => {
        if (isOpen && selectedDate) {
            const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            baseballApi.getDiary(dateStr).then(data => {
                if (data) {
                    setDiaryData(data);
                    setMode('read');
                } else {
                    setDiaryData(null);
                    setMode('create');
                }
            });
        }
    }, [isOpen, selectedDate]);

    const handleCreate = async (data: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>) => {
        const success = await baseballApi.createDiary(data);
        if (success && selectedDate) {
            const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            const newData = await baseballApi.getDiary(dateStr);
            setDiaryData(newData);
            setMode('read');
        }
    };

    const handleUpdate = async (data: Diary) => {
        if (!selectedDate) return;
        const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const success = await baseballApi.updateDiary(dateStr, data);
        if (success) {
            setDiaryData(data);
            setMode('read');
        }
    };

    const handleDelete = async () => {
        if (!selectedDate) return;
        const dateStr = formatDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const success = await baseballApi.deleteDiary(dateStr);
        if (success) {
            onClose(); // Or switch to create mode? Closing is probably better UX for "Deleted"
        }
    };

    if (!isOpen || !selectedDate) return null;

    const renderContent = () => {
        switch (mode) {
            case 'create':
                return (
                    <DiaryCreate
                        date={selectedDate}
                        onCancel={onClose}
                        onSubmit={handleCreate}
                    />
                );
            case 'read':
                return diaryData ? (
                    <DiaryRead
                        diary={diaryData}
                        onEdit={() => setMode('edit')}
                        onClose={onClose}
                        onDelete={handleDelete}
                    />
                ) : null;
            case 'edit':
                return diaryData ? (
                    <DiaryEdit
                        diary={diaryData}
                        onCancel={() => setMode('read')}
                        onSave={handleUpdate}
                    />
                ) : null;
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Container - Expanded Size */}
            <div className="relative w-11/12 max-w-6xl h-[85vh] bg-bg-secondary rounded-2xl shadow-2xl flex flex-col transform transition-all animate-fade-in-up overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 text-text-secondary hover:text-text-primary transition-colors bg-bg-secondary/50 rounded-full p-2"
                >
                    <FaTimes size={24} />
                </button>

                {renderContent()}
            </div>
        </div>,
        document.body
    );
};

export default DiaryModal;
