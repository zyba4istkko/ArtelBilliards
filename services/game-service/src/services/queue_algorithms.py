"""
Queue Algorithms - Алгоритмы генерации очередности игроков
"""

import random
import math
from typing import List, Dict, Any
from uuid import UUID


class QueueAlgorithms:
    """Класс для генерации очередности игроков"""
    
    @staticmethod
    def generate_always_random_queue(participants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Always Random - Всегда случайная очередь для каждой игры
        
        Args:
            participants: Список участников сессии
            
        Returns:
            Список участников в случайном порядке
        """
        shuffled = participants.copy()
        random.shuffle(shuffled)
        return shuffled
    
    @staticmethod
    def generate_random_no_repeat_queue(
        participants: List[Dict[str, Any]], 
        session_id: UUID,
        previous_queues: List[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Random No Repeat - Случайная без повторения последних комбинаций
        
        Args:
            participants: Список участников сессии
            session_id: ID сессии для логирования
            previous_queues: История предыдущих очередностей (опционально)
            
        Returns:
            Список участников в случайном порядке без повторений
        """
        if not previous_queues:
            previous_queues = []
        
        # Получаем все возможные перестановки
        from itertools import permutations
        
        all_permutations = list(permutations(participants))
        total_permutations = math.factorial(len(participants))
        
        # Автоматически определяем размер истории
        # Для полного цикла без повторений храним (N! - 1) игр
        max_history = total_permutations - 1
        
        # Исключаем недавно использованные очередности
        recent_queues = previous_queues[-max_history:] if previous_queues else []
        available_queues = [
            perm for perm in all_permutations 
            if list(perm) not in recent_queues
        ]
        
        # Если все варианты использованы - сбрасываем историю и начинаем новый цикл
        if not available_queues:
            available_queues = all_permutations
            print(f"🔄 Session {session_id}: Завершен полный цикл из {total_permutations} игр. Начинаем новый цикл.")
        
        # Выбираем случайный из доступных
        return list(random.choice(available_queues))
    
    @staticmethod
    def generate_manual_queue(
        participants: List[Dict[str, Any]], 
        custom_order: List[UUID] = None
    ) -> List[Dict[str, Any]]:
        """
        Manual - Ручная настройка очереди
        
        Args:
            participants: Список участников сессии
            custom_order: Пользовательский порядок ID участников
            
        Returns:
            Список участников в указанном порядке или исходный порядок
        """
        if not custom_order:
            return participants
        
        # Создаем словарь для быстрого поиска участников по ID
        participants_dict = {str(p['id']): p for p in participants}
        
        # Строим очередь согласно custom_order
        ordered_queue = []
        for participant_id in custom_order:
            if str(participant_id) in participants_dict:
                ordered_queue.append(participants_dict[str(participant_id)])
        
        # Добавляем участников, которых нет в custom_order
        for participant in participants:
            if participant not in ordered_queue:
                ordered_queue.append(participant)
        
        return ordered_queue


def get_queue_algorithm(algorithm_name: str):
    """
    Фабричная функция для получения алгоритма по имени
    
    Args:
        algorithm_name: Название алгоритма
        
    Returns:
        Функция генерации очередности
    """
    algorithms = {
        "always_random": QueueAlgorithms.generate_always_random_queue,
        "random_no_repeat": QueueAlgorithms.generate_random_no_repeat_queue,
        "manual": QueueAlgorithms.generate_manual_queue
    }
    
    return algorithms.get(algorithm_name, QueueAlgorithms.generate_random_no_repeat_queue)
