import React, { useState } from 'react';
import { UserProfile, Subject, Task, SkillTreeNode } from '../types';
import { playClickSound } from '../utils/audio';

interface SkillTreeViewProps {
  userProfile: UserProfile;
  subjects: Subject[];
  tasks: Task[];
  skillTreeNodes: SkillTreeNode[];
  onSelectTopicForSmartStudy?: (topicName: string) => void;
  onAddTaskForSkill?: (topicName: string, subjectId: string) => void;
}

export const SkillTreeView: React.FC<SkillTreeViewProps> = ({
  userProfile,
  subjects,
  tasks,
  skillTreeNodes,
  onSelectTopicForSmartStudy,
  onAddTaskForSkill,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(skillTreeNodes[0]?.id || 'sk-calc-1');

  const activeNode = skillTreeNodes.find((n) => n.id === selectedNodeId) || skillTreeNodes[0];
  const activeSubject = subjects.find((s) => s.id === activeNode?.subjectId);

  // Filter nodes
  const visibleNodes =
    selectedSubjectFilter === 'all'
      ? skillTreeNodes
      : skillTreeNodes.filter((n) => n.subjectId === selectedSubjectFilter);

  // Group nodes by subject
  const subjectsWithNodes = subjects.map((sub) => ({
    subject: sub,
    nodes: skillTreeNodes.filter((n) => n.subjectId === sub.id),
  })).filter((group) => selectedSubjectFilter === 'all' || group.subject.id === selectedSubjectFilter);

  // Total overall stats
  const totalMastered = skillTreeNodes.filter((n) => n.status === 'mastered').length;
  const overallMasteryPct = Math.round(
    skillTreeNodes.reduce((a, c) => a + c.masteryPercentage, 0) / (skillTreeNodes.length || 1)
  );

  return (
    <div id="skill-tree-view-container" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Header Bar */}
      <div
        id="skill-tree-header-card"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-2xl text-emerald-600">
            🌳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                Visualized Academic Skill Tree
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                User ➔ Subject ➔ Topics Covered
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Interactive competency tree mapping your learning milestones, completed topics, and mastery level
            </p>
          </div>
        </div>

        {/* Filter by Subject */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600 uppercase">Subject:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => {
              playClickSound();
              setSelectedSubjectFilter(e.target.value);
            }}
            className="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2 text-xs font-bold text-blue-600 border-none outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            <option value="all">All Subjects ({subjects.length})</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout: Skill Tree Graph Canvas + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left / Center: Tree Visualization Canvas */}
        <div
          id="skill-tree-canvas-card"
          className="lg:col-span-8 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 sm:p-7 flex flex-col gap-6 overflow-x-auto"
        >
          {/* Level 0: USER ROOT NODE */}
          <div className="flex flex-col items-center">
            <div
              id="skill-tree-user-root-node"
              className="px-6 py-4 rounded-3xl bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] border-2 border-blue-400 flex items-center gap-4 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <img
                src={userProfile.profilePicture}
                alt={userProfile.name}
                className="w-12 h-12 rounded-2xl bg-white/60 p-1 shadow-inner"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-gray-800">{userProfile.name}</h3>
                  <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                    Rank: Scholar
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-gray-500">
                  {userProfile.domainOfStudying} • {userProfile.studentEducation}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-600">
                  <span>🔥 {userProfile.streakCount} Day Streak</span>
                  <span>🪙 {userProfile.creditsValue} Credits</span>
                  <span className="text-emerald-600">⭐️ {totalMastered} Topics Mastered ({overallMasteryPct}%)</span>
                </div>
              </div>
            </div>

            {/* Downward connecting branch */}
            <div className="w-1 h-6 bg-blue-400/60 my-1 rounded-full" />
          </div>

          {/* Level 1 & Level 2: Subject Nodes & Covered Topic Leaves */}
          <div className="flex flex-col gap-8">
            {subjectsWithNodes.map((group) => {
              const { subject, nodes } = group;
              const subjectCompletedTasks = tasks.filter((t) => t.subjectId === subject.id && t.completed);
              const avgMastery = nodes.length > 0
                ? Math.round(nodes.reduce((a, c) => a + c.masteryPercentage, 0) / nodes.length)
                : 0;

              return (
                <div
                  key={subject.id}
                  className="rounded-3xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] p-5 flex flex-col gap-4 border border-white/40"
                >
                  {/* Subject Branch Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-gray-300/60">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm"
                        style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                      >
                        {subject.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-800">{subject.name}</h4>
                        <span className="text-[10px] font-semibold text-gray-500">
                          {subject.category || 'Academic Subject'} • {subjectCompletedTasks.length} tasks completed
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-300 rounded-full h-2 shadow-inner overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${avgMastery}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-gray-700">{avgMastery}%</span>
                    </div>
                  </div>

                  {/* Topic Nodes Grid under this Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 pt-1">
                    {nodes.map((node) => {
                      const isSelected = node.id === selectedNodeId;
                      const isMastered = node.status === 'mastered';

                      return (
                        <button
                          key={node.id}
                          onClick={() => {
                            playClickSound();
                            setSelectedNodeId(node.id);
                          }}
                          className={`flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] ring-2 scale-[1.02]'
                              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
                          }`}
                          style={{
                            borderColor: isSelected ? subject.color : 'transparent',
                            // @ts-ignore
                            '--tw-ring-color': isSelected ? subject.color : undefined,
                          }}
                        >
                          <div className="flex items-start justify-between gap-1 w-full">
                            <span className="text-[10px] font-extrabold uppercase text-gray-400">
                              {node.category}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                isMastered
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isMastered ? '⭐️ Mastered' : `⏳ ${node.masteryLevel}`}
                            </span>
                          </div>

                          <h5 className="text-xs font-black text-gray-800 mt-1 mb-2">
                            {node.topicName}
                          </h5>

                          {/* Mini Progress & Task Count */}
                          <div className="mt-auto pt-2 border-t border-gray-300/40 flex items-center justify-between text-[10px] font-bold text-gray-500">
                            <span>{node.tasksCovered.length} tasks linked</span>
                            <span className="font-extrabold" style={{ color: subject.color }}>
                              {node.masteryPercentage}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Skill Topic Inspector */}
        <div
          id="skill-inspector-card"
          className="lg:col-span-4 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 sm:p-6 flex flex-col justify-between gap-5"
        >
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-300/50">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]"
                style={{ backgroundColor: `${activeSubject?.color || '#3b82f6'}20` }}
              >
                {activeSubject?.icon || '📚'}
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {activeSubject?.name || 'Subject'} • {activeNode?.category}
                </span>
                <h3 className="text-base font-black text-gray-800 leading-tight">
                  {activeNode?.topicName}
                </h3>
              </div>
            </div>

            {/* Mastery Card */}
            <div className="mt-4 p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-gray-600">Mastery Level:</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-white text-[11px]"
                  style={{ backgroundColor: activeSubject?.color || '#3b82f6' }}
                >
                  {activeNode?.masteryLevel} ({activeNode?.masteryPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2.5 shadow-inner overflow-hidden mt-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${activeNode?.masteryPercentage || 0}%`,
                    backgroundColor: activeSubject?.color || '#3b82f6',
                  }}
                />
              </div>
            </div>

            {/* Key Formulas & Core Concept Notes */}
            <div className="mt-4">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Core Governing Formulas & Rules
              </h4>
              <div className="space-y-2">
                {activeNode?.formulasOrKeyNotes?.map((formula, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] font-mono text-[11px] font-bold text-blue-900 leading-relaxed border border-white/60"
                  >
                    {formula}
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks & Topics Covered */}
            <div className="mt-4">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Covered Tasks & Assignments
              </h4>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {activeNode?.tasksCovered?.map((taskTitle, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-semibold text-gray-700"
                  >
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span className="truncate">{taskTitle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-300/50 flex flex-col gap-2.5">
            {onSelectTopicForSmartStudy && (
              <button
                onClick={() => {
                  playClickSound();
                  onSelectTopicForSmartStudy(activeNode.topicName);
                }}
                className="w-full py-2.5 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:bg-blue-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>🧠 Review in Smart Study (Mind Map / Flashcard)</span>
                <span>➔</span>
              </button>
            )}

            {onAddTaskForSkill && (
              <button
                onClick={() => {
                  playClickSound();
                  onAddTaskForSkill(
                    `Review & Problem Set: ${activeNode.topicName}`,
                    activeNode.subjectId
                  );
                }}
                className="w-full py-2 rounded-2xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700 flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>➕ Add Task for this Skill</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
