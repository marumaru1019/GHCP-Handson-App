import { render, screen, fireEvent } from '@testing-library/react';
import { TagFilter } from './TagFilter';

describe('TagFilter', () => {
  const defaultProps = {
    availableTags: ['仕事', '開発', '個人'],
    selectedTag: null,
    onTagSelect: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('使用可能なタグがない場合は何も表示されない', () => {
    const { container } = render(
      <TagFilter {...defaultProps} availableTags={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('タグ一覧と"すべて"ボタンが表示される', () => {
    render(<TagFilter {...defaultProps} />);
    
    expect(screen.getByText('タグでフィルタ:')).toBeTruthy();
    expect(screen.getByText('すべて')).toBeTruthy();
    expect(screen.getByText('仕事')).toBeTruthy();
    expect(screen.getByText('開発')).toBeTruthy();
    expect(screen.getByText('個人')).toBeTruthy();
  });

  it('選択されたタグがない場合、"すべて"ボタンがアクティブ', () => {
    render(<TagFilter {...defaultProps} />);
    
    const allButton = screen.getByText('すべて');
    expect(allButton.className).toMatch(/bg-gray-800|dark:bg-gray-200/);
  });

  it('選択されたタグがある場合、そのタグボタンがアクティブ', () => {
    render(<TagFilter {...defaultProps} selectedTag="仕事" />);
    
    const workButton = screen.getByText('仕事');
    expect(workButton.className).toMatch(/bg-blue-500/);
  });

  it('タグボタンをクリックするとonTagSelectが呼ばれる', () => {
    render(<TagFilter {...defaultProps} />);
    
    fireEvent.click(screen.getByText('仕事'));
    expect(defaultProps.onTagSelect).toHaveBeenCalledWith('仕事');
  });

  it('"すべて"ボタンをクリックするとnullが渡される', () => {
    render(<TagFilter {...defaultProps} selectedTag="仕事" />);
    
    fireEvent.click(screen.getByText('すべて'));
    expect(defaultProps.onTagSelect).toHaveBeenCalledWith(null);
  });

  it('選択中のタグをクリックすると選択解除される', () => {
    render(<TagFilter {...defaultProps} selectedTag="仕事" />);
    
    fireEvent.click(screen.getByText('仕事'));
    expect(defaultProps.onTagSelect).toHaveBeenCalledWith(null);
  });
});