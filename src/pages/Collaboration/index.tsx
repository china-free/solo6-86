import { useState, useEffect } from 'react';
import { Users, Copy, RefreshCw, UserPlus, Trash2, Crown, Circle } from 'lucide-react';
import { useCollabStore } from '@/store/useCollabStore';
import type { FamilyMember } from '@/types';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import { generateId } from '@/utils/date';

const AVATAR_OPTIONS = [
  '🧑', '👩', '👨', '👧', '👦', '🧒',
  '👵', '👴', '🧔', '👱', '🧑‍🍳', '👩‍🍳',
];

const COLOR_OPTIONS = [
  '#2D5A27',
  '#E07A5F',
  '#8B7355',
  '#6B8E23',
  '#CD853F',
  '#4682B4',
  '#9370DB',
  '#20B2AA',
];

const CollaborationPage = () => {
  const {
    members,
    currentMemberId,
    collabCode,
    isCollaborating,
    startCollaboration,
    stopCollaboration,
    addMember,
    removeMember,
    setCurrentMember,
    generateCollabCode,
    resetCollabCode,
  } = useCollabStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('🧑');
  const [newMemberColor, setNewMemberColor] = useState('#2D5A27');
  const [newMemberIsAdmin, setNewMemberIsAdmin] = useState(false);

  useEffect(() => {
    if (!collabCode) {
      generateCollabCode();
    }
  }, [collabCode, generateCollabCode]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(collabCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    addMember(newMemberName, newMemberAvatar, newMemberColor, newMemberIsAdmin);
    setShowAddModal(false);
    setNewMemberName('');
    setNewMemberAvatar('🧑');
    setNewMemberColor('#2D5A27');
    setNewMemberIsAdmin(false);
  };

  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      removeMember(memberToDelete);
    }
    setShowDeleteConfirm(false);
    setMemberToDelete(null);
  };

  const currentMember = members.find((m) => m.id === currentMemberId);

  const formatLastActive = (timestamp: number): string => {
    if (!timestamp) return '离线';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl text-primary-700 mb-1">
            家庭协作
          </h2>
          <p className="text-primary-500 text-sm">
            邀请家人一起规划菜单，实时同步更新
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} />
          添加成员
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-primary-600" />
                <h3 className="font-display text-lg text-primary-700">
                  家庭成员
                </h3>
              </div>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 text-sm font-medium rounded-full">
                {members.length} 人
              </span>
            </div>

            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all animate-slide-up ${
                    member.id === currentMemberId
                      ? 'bg-primary-50 border-2 border-primary-300'
                      : 'bg-cream-50 border border-cream-100 hover:border-primary-200'
                  }`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                        style={{ backgroundColor: member.color + '20' }}
                      >
                        {member.avatar}
                      </div>
                      {member.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary-700">
                          {member.name}
                        </span>
                        {member.isAdmin && (
                          <Crown size={14} className="text-warm-500" />
                        )}
                        {member.id === currentMemberId && (
                          <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                            我
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary-500">
                        {member.isOnline ? (
                          <span className="flex items-center gap-1">
                            <Circle size={8} className="text-green-500 fill-green-500" />
                            在线
                          </span>
                        ) : (
                          `最后活跃: ${formatLastActive(member.lastActive)}`
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.id !== currentMemberId && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCurrentMember(member.id)}
                        >
                          切换
                        </Button>
                        <button
                          onClick={() => handleDeleteClick(member.id)}
                          className="p-2 rounded-xl text-accent-500 hover:bg-accent-50 transition-colors btn-press"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-soft-lg">
            <div className="flex items-center gap-2 mb-4">
              <Users size={20} />
              <span className="font-medium">协作状态</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`w-3 h-3 rounded-full ${
                  isCollaborating ? 'bg-green-400 animate-pulse' : 'bg-white/40'
                }`}
              ></span>
              <span className="text-white/90">
                {isCollaborating ? '协作已开启' : '协作未开启'}
              </span>
            </div>
            <Button
              variant="secondary"
              fullWidth
              onClick={isCollaborating ? stopCollaboration : startCollaboration}
              className="justify-center bg-white/20 text-white hover:bg-white/30 border-0"
            >
              <RefreshCw size={16} />
              {isCollaborating ? '关闭协作' : '开启协作'}
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200">
            <h3 className="font-display text-lg text-primary-700 mb-3">
              协作码
            </h3>
            <p className="text-sm text-primary-500 mb-4">
              分享协作码给家人，他们就可以加入一起编辑菜单
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 px-4 py-3 bg-cream-50 rounded-xl text-center font-mono text-xl text-primary-700 tracking-widest">
                {collabCode || '------'}
              </div>
              <button
                onClick={handleCopyCode}
                className={`p-3 rounded-xl transition-all btn-press ${
                  copied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                }`}
              >
                {copied ? (
                  <span className="text-sm font-medium">已复制</span>
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>

            <button
              onClick={resetCollabCode}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-primary-600 hover:bg-cream-50 rounded-xl transition-colors"
            >
              <RefreshCw size={16} />
              重置协作码
            </button>
          </div>

          <div className="bg-warm-50 rounded-2xl p-5 border border-warm-100">
            <h3 className="font-display text-lg text-primary-700 mb-2">
              💡 使用提示
            </h3>
            <ul className="text-sm text-primary-600 space-y-2">
              <li>• 在多个浏览器标签页打开可模拟多人协作</li>
              <li>• 开启协作后，所有成员可以实时看到更新</li>
              <li>• 协作码可以随时重置，旧的邀请码将失效</li>
              <li>• 管理员可以管理成员和重置协作码</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加家庭成员"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              选择头像
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setNewMemberAvatar(avatar)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all btn-press ${
                    newMemberAvatar === avatar
                      ? 'bg-primary-100 border-2 border-primary-400 scale-110'
                      : 'bg-cream-50 border border-cream-200 hover:border-primary-300'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              标识颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewMemberColor(color)}
                  className={`w-10 h-10 rounded-full transition-all btn-press ${
                    newMemberColor === color
                      ? 'ring-2 ring-offset-2 ring-primary-400 scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              成员名称
            </label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="例如：妈妈、爸爸、小明"
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-primary-700 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-700">设为管理员</span>
            <button
              onClick={() => setNewMemberIsAdmin(!newMemberIsAdmin)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                newMemberIsAdmin ? 'bg-primary-500' : 'bg-cream-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  newMemberIsAdmin ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></span>
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowAddModal(false)}
              className="justify-center"
            >
              取消
            </Button>
            <Button
              fullWidth
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
              className="justify-center"
            >
              <UserPlus size={18} />
              添加
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMemberToDelete(null);
        }}
        title="确认删除"
        size="sm"
      >
        <p className="text-primary-600 mb-6">
          确定要删除这个成员吗？删除后无法恢复。
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setShowDeleteConfirm(false);
              setMemberToDelete(null);
            }}
            className="justify-center"
          >
            取消
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleConfirmDelete}
            className="justify-center"
          >
            <Trash2 size={18} />
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CollaborationPage;
