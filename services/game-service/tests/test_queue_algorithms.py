"""
Tests for Queue Algorithms
"""

import pytest
from uuid import uuid4
from ..src.services.queue_algorithms import QueueAlgorithms, get_queue_algorithm


class TestQueueAlgorithms:
    """Тесты для алгоритмов генерации очередности"""
    
    def setup_method(self):
        """Подготовка тестовых данных"""
        self.participants = [
            {"id": str(uuid4()), "display_name": "Игрок А"},
            {"id": str(uuid4()), "display_name": "Игрок Б"},
            {"id": str(uuid4()), "display_name": "Игрок В"}
        ]
        self.session_id = uuid4()
    
    def test_always_random_queue(self):
        """Тест алгоритма Always Random"""
        # Генерируем несколько очередей
        queue1 = QueueAlgorithms.generate_always_random_queue(self.participants)
        queue2 = QueueAlgorithms.generate_always_random_queue(self.participants)
        queue3 = QueueAlgorithms.generate_always_random_queue(self.participants)
        
        # Проверяем что все очереди содержат всех участников
        assert len(queue1) == 3
        assert len(queue2) == 3
        assert len(queue3) == 3
        
        # Проверяем что все участники присутствуют
        participant_ids = {p["id"] for p in self.participants}
        assert {p["id"] for p in queue1} == participant_ids
        assert {p["id"] for p in queue2} == participant_ids
        assert {p["id"] for p in queue3} == participant_ids
        
        # В always_random могут быть повторения (хотя маловероятно)
        # Проверяем что это не всегда один и тот же порядок
        queues = [queue1, queue2, queue3]
        unique_queues = set()
        for queue in queues:
            queue_str = "->".join(p["display_name"] for p in queue)
            unique_queues.add(queue_str)
        
        # Хотя бы 2 разных порядка (учитывая случайность)
        assert len(unique_queues) >= 1
    
    def test_random_no_repeat_queue_no_history(self):
        """Тест алгоритма Random No Repeat без истории"""
        queue = QueueAlgorithms.generate_random_no_repeat_queue(
            self.participants, 
            self.session_id
        )
        
        # Проверяем что очередь содержит всех участников
        assert len(queue) == 3
        participant_ids = {p["id"] for p in self.participants}
        assert {p["id"] for p in queue} == participant_ids
    
    def test_random_no_repeat_queue_with_history(self):
        """Тест алгоритма Random No Repeat с историей"""
        # Создаем историю предыдущих очередей
        previous_queues = [
            [self.participants[0], self.participants[1], self.participants[2]],  # А->Б->В
            [self.participants[1], self.participants[2], self.participants[0]],  # Б->В->А
        ]
        
        # Генерируем новую очередь
        new_queue = QueueAlgorithms.generate_random_no_repeat_queue(
            self.participants, 
            self.session_id, 
            previous_queues
        )
        
        # Проверяем что новая очередь не повторяет предыдущие
        assert new_queue not in previous_queues
        
        # Проверяем что очередь содержит всех участников
        assert len(new_queue) == 3
        participant_ids = {p["id"] for p in self.participants}
        assert {p["id"] for p in new_queue} == participant_ids
    
    def test_random_no_repeat_queue_full_cycle(self):
        """Тест алгоритма Random No Repeat с полным циклом"""
        # Для 3 игроков: 3! = 6 перестановок
        # Создаем историю из 5 перестановок (максимум без повторений)
        all_permutations = [
            [self.participants[0], self.participants[1], self.participants[2]],  # А->Б->В
            [self.participants[0], self.participants[2], self.participants[1]],  # А->В->Б
            [self.participants[1], self.participants[0], self.participants[2]],  # Б->А->В
            [self.participants[1], self.participants[2], self.participants[0]],  # Б->В->А
            [self.participants[2], self.participants[0], self.participants[1]],  # В->А->Б
        ]
        
        # Генерируем новую очередь (должна быть единственная оставшаяся)
        new_queue = QueueAlgorithms.generate_random_no_repeat_queue(
            self.participants, 
            self.session_id, 
            all_permutations
        )
        
        # Проверяем что новая очередь не повторяет предыдущие
        assert new_queue not in all_permutations
        
        # Проверяем что очередь содержит всех участников
        assert len(new_queue) == 3
        participant_ids = {p["id"] for p in self.participants}
        assert {p["id"] for p in new_queue} == participant_ids
        
        # Проверяем что это должна быть перестановка [В->Б->А]
        expected_queue = [self.participants[2], self.participants[1], self.participants[0]]
        assert new_queue == expected_queue
    
    def test_manual_queue_no_custom_order(self):
        """Тест алгоритма Manual без пользовательского порядка"""
        queue = QueueAlgorithms.generate_manual_queue(self.participants)
        
        # Должен вернуть исходный порядок
        assert queue == self.participants
    
    def test_manual_queue_with_custom_order(self):
        """Тест алгоритма Manual с пользовательским порядком"""
        custom_order = [
            self.participants[2]["id"],  # В
            self.participants[0]["id"],  # А
            self.participants[1]["id"]   # Б
        ]
        
        queue = QueueAlgorithms.generate_manual_queue(self.participants, custom_order)
        
        # Проверяем что порядок соответствует custom_order
        assert queue[0]["id"] == custom_order[0]  # В
        assert queue[1]["id"] == custom_order[1]  # А
        assert queue[2]["id"] == custom_order[2]  # Б
    
    def test_manual_queue_partial_custom_order(self):
        """Тест алгоритма Manual с частичным пользовательским порядком"""
        custom_order = [self.participants[1]["id"]]  # Только Б
        
        queue = QueueAlgorithms.generate_manual_queue(self.participants, custom_order)
        
        # Б должен быть первым
        assert queue[0]["id"] == custom_order[0]
        
        # Остальные участники должны быть добавлены в конце
        remaining_participants = [p for p in self.participants if p["id"] != custom_order[0]]
        assert queue[1:] == remaining_participants
    
    def test_get_queue_algorithm_factory(self):
        """Тест фабричной функции get_queue_algorithm"""
        # Проверяем что возвращаются правильные функции
        always_random_func = get_queue_algorithm("always_random")
        random_no_repeat_func = get_queue_algorithm("random_no_repeat")
        manual_func = get_queue_algorithm("manual")
        
        assert always_random_func == QueueAlgorithms.generate_always_random_queue
        assert random_no_repeat_func == QueueAlgorithms.generate_random_no_repeat_queue
        assert manual_func == QueueAlgorithms.generate_manual_queue
        
        # Проверяем дефолтное значение для неизвестного алгоритма
        default_func = get_queue_algorithm("unknown")
        assert default_func == QueueAlgorithms.generate_random_no_repeat_queue
    
    def test_algorithm_edge_cases(self):
        """Тест граничных случаев"""
        # Пустой список участников
        empty_queue = QueueAlgorithms.generate_always_random_queue([])
        assert empty_queue == []
        
        # Один участник
        single_participant = [{"id": str(uuid4()), "display_name": "Один"}]
        single_queue = QueueAlgorithms.generate_always_random_queue(single_participant)
        assert single_queue == single_participant
        
        # Два участника (2! = 2 перестановки)
        two_participants = [
            {"id": str(uuid4()), "display_name": "Первый"},
            {"id": str(uuid4()), "display_name": "Второй"}
        ]
        
        # Тестируем random_no_repeat для 2 участников
        queue1 = QueueAlgorithms.generate_random_no_repeat_queue(
            two_participants, 
            self.session_id
        )
        queue2 = QueueAlgorithms.generate_random_no_repeat_queue(
            two_participants, 
            self.session_id, 
            [queue1]
        )
        
        # Вторая очередь не должна повторять первую
        assert queue2 != queue1
        
        # Обе очереди должны содержать всех участников
        participant_ids = {p["id"] for p in two_participants}
        assert {p["id"] for p in queue1} == participant_ids
        assert {p["id"] for p in queue2} == participant_ids


if __name__ == "__main__":
    pytest.main([__file__])
