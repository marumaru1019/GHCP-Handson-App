import { render, screen } from '@testing-library/react';
import { KanbanCard } from './KanbanCard';
import type { Todo } from '@/types';

describe('KanbanCard', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: new Date(),
    status: 'todo',
    priority: 'medium'
  };

  const defaultProps = {
    todo: mockTodo,
    onDragStart: jest.fn(),
    onDragEnd: jest.fn(),
    onUpdatePriority: jest.fn(),
    onEditTodo: jest.fn(),
    onDeleteTodo: jest.fn(),
    isDragging: false
  };

  it('renders todo text', () => {
    render(<KanbanCard {...defaultProps} />);
    expect(screen.getByText('Test todo')).toBeTruthy();
  });

  it('displays priority badge', () => {
    render(<KanbanCard {...defaultProps} />);
    expect(screen.getByText('MEDIUM')).toBeTruthy(); // medium priority in English
  });
});
