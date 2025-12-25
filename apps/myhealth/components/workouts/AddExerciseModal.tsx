import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useUITheme as useTheme } from '@mysuite/ui';

interface AddExerciseModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, sets: string, reps: string) => void;
}

export function AddExerciseModal({ visible, onClose, onAdd }: AddExerciseModalProps) {
    const theme = useTheme();

    const [name, setName] = useState("");
    const [sets, setSets] = useState("3");
    const [reps, setReps] = useState("10");

    const handleAdd = () => {
        onAdd(name, sets, reps);
        setName("");
        setSets("3");
        setReps("10");
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-[90%] p-5 rounded-2xl bg-light dark:bg-dark border border-light dark:border-white/10">
                    <Text className="text-xl font-bold mb-4 text-light dark:text-dark">Add Exercise</Text>
                    <TextInput 
                        placeholder="Name" 
                        placeholderTextColor={theme.icon || "#9ca3af"}
                        value={name} 
                        onChangeText={setName} 
                        className="border border-light dark:border-white/10 rounded-lg p-3 mb-3 text-light dark:text-dark bg-light-lighter dark:bg-border-dark"
                    />
                    <TextInput 
                        placeholder="Sets" 
                        placeholderTextColor={theme.icon || "#9ca3af"}
                        value={sets} 
                        onChangeText={setSets} 
                        className="border border-light dark:border-white/10 rounded-lg p-3 mb-3 text-light dark:text-dark bg-light-lighter dark:bg-border-dark"
                        keyboardType="number-pad" 
                    />
                    <TextInput 
                        placeholder="Reps" 
                        placeholderTextColor={theme.icon || "#9ca3af"}
                        value={reps} 
                        onChangeText={setReps} 
                        className="border border-light dark:border-white/10 rounded-lg p-3 mb-3 text-light dark:text-dark bg-light-lighter dark:bg-border-dark"
                        keyboardType="number-pad" 
                    />

                    <View className="flex-row justify-end mt-2 gap-2">
                        <TouchableOpacity onPress={onClose} className="px-4 py-2.5 rounded-lg border border-light dark:border-white/10 bg-transparent"> 
                            <Text className="text-light dark:text-dark font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAdd} className="px-4 py-2.5 rounded-lg bg-primary dark:bg-primary-dark">
                            <Text className="text-white font-bold">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
