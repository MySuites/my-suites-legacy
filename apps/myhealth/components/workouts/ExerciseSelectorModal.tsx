import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { ThemedView } from '../ui/ThemedView';
import { ThemedText } from '../ui/ThemedText';
import { IconSymbol } from '../ui/icon-symbol';
import { useUITheme } from '@mycsuite/ui';

interface ExerciseSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (exercise: any) => void;
    exercises: any[];
    isLoading: boolean;
}

export const ExerciseSelectorModal = ({
    visible,
    onClose,
    onSelect,
    exercises,
    isLoading
}: ExerciseSelectorModalProps) => {
    const theme = useUITheme();
    const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const uniqueCategories = ["All", ...Array.from(new Set(exercises.map(e => e.category))).filter(Boolean).sort()];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <ThemedView className="flex-1">
                <View className="flex-row items-center justify-between p-4 border-b border-surface dark:border-white/10 pt-4 android:pt-10">
                    <TouchableOpacity onPress={onClose} className="p-2">
                            <ThemedText type="link">Cancel</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="subtitle">Add Exercise</ThemedText>
                    <View style={{ width: 50 }} />
                </View>
                
                <View className="flex-1 p-4">
                    {/* Filter Chips */}
                    <View className="mb-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {uniqueCategories.map((category) => (
                                <TouchableOpacity 
                                    key={category} 
                                    onPress={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full mr-2 border ${selectedCategory === category ? 'bg-primary dark:bg-primary_dark border-transparent' : 'bg-transparent border-surface dark:border-white/10'}`}
                                >
                                    <Text className={`font-semibold ${selectedCategory === category ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    
                    <View className="flex-row items-center bg-surface dark:bg-surface_dark rounded-lg px-2.5 h-12 mb-4 border border-black/5 dark:border-white/10">
                        <IconSymbol name="magnifyingglass" size={20} color={theme.icon || '#888'} />
                        <TextInput
                            className="flex-1 ml-2 text-base h-full text-apptext dark:text-apptext_dark"
                            placeholder="Search exercises..."
                            placeholderTextColor={theme.icon || '#888'}
                            value={exerciseSearchQuery}
                            onChangeText={setExerciseSearchQuery}
                            autoCorrect={false}
                        />
                        {exerciseSearchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setExerciseSearchQuery('')}>
                                    <IconSymbol name="xmark.circle.fill" size={20} color={theme.icon || '#888'} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.primary} className="mt-4" />
                    ) : (
                        <FlatList
                            data={exercises.filter(ex => {
                                const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                                const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
                                return matchesSearch && matchesCategory;
                            })}
                            keyExtractor={(item) => item.id}
                            className="flex-1"
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    className="flex-row items-center justify-between py-3 border-b border-surface dark:border-surface_dark"
                                    onPress={() => {
                                        onSelect(item);
                                        setExerciseSearchQuery(""); // Clear search on select
                                    }}
                                >
                                    <View>
                                        <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>{item.name}</ThemedText>
                                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                            {item.category} • {item.properties?.join(', ') || item.type || item.rawType}
                                        </Text> 
                                    </View>
                                    <IconSymbol name="plus.circle" size={28} color={theme.primary} />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text className="text-center text-gray-500 mt-4">No exercises found.</Text>
                            }
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </ThemedView>
        </Modal>
    );
};
