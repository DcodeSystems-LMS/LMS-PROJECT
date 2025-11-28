import React from 'react';

export interface AssessmentSettings {
  time_limit: number; // in minutes
  max_attempts: number;
  passing_score: number; // percentage
  availability_start?: string;
  availability_end?: string;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  allow_review: boolean;
  auto_submit: boolean;
  prevent_copy_paste: boolean;
  require_fullscreen: boolean;
  webcam_monitoring: boolean;
  late_submission_penalty: number; // percentage
}

interface AssessmentSettingsProps {
  settings: AssessmentSettings;
  onChange: (settings: AssessmentSettings) => void;
  disabled?: boolean;
}

const AssessmentSettings: React.FC<AssessmentSettingsProps> = ({
  settings,
  onChange,
  disabled = false
}) => {
  const updateSetting = (key: keyof AssessmentSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Assessment Settings</h3>
      
      {/* Time & Attempts */}
      <div className="flex items-end space-x-6">
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="300"
            value={settings.time_limit}
            onChange={(e) => updateSetting('time_limit', parseInt(e.target.value) || 30)}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Set to 0 for unlimited
          </p>
        </div>

        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Attempts
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.max_attempts}
            onChange={(e) => updateSetting('max_attempts', parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            (1-10)
          </p>
        </div>
      </div>

      {/* Passing Score */}
      <div className="flex items-end space-x-4">
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passing Score (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={settings.passing_score}
            onChange={(e) => updateSetting('passing_score', parseInt(e.target.value) || 60)}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500 mb-2">
          (0-100%)
        </div>
      </div>

      {/* Availability Period */}
      <div className="flex items-end space-x-6">
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available From
          </label>
          <input
            type="datetime-local"
            value={settings.availability_start || ''}
            onChange={(e) => updateSetting('availability_start', e.target.value)}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Until
          </label>
          <input
            type="datetime-local"
            value={settings.availability_end || ''}
            onChange={(e) => updateSetting('availability_end', e.target.value)}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Late Submission Penalty */}
      <div className="flex items-end space-x-4">
        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Late Submission Penalty (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={settings.late_submission_penalty}
            onChange={(e) => updateSetting('late_submission_penalty', parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500 mb-2">
          (0-100%)
        </div>
        <p className="text-xs text-gray-500">
          Percentage penalty for late submissions
        </p>
      </div>

      {/* Randomization Settings */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Randomization & Fairness</h4>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.shuffle_questions}
              onChange={(e) => updateSetting('shuffle_questions', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Shuffle question order for each student
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.shuffle_options}
              onChange={(e) => updateSetting('shuffle_options', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Shuffle answer options for each question
            </span>
          </label>
        </div>
      </div>

      {/* Feedback Settings */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Feedback & Review</h4>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.show_correct_answers}
              onChange={(e) => updateSetting('show_correct_answers', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Show correct answers after submission
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.show_explanations}
              onChange={(e) => updateSetting('show_explanations', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Show explanations for correct answers
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.allow_review}
              onChange={(e) => updateSetting('allow_review', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Allow students to review their answers before submission
            </span>
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Security & Integrity</h4>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.auto_submit}
              onChange={(e) => updateSetting('auto_submit', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Auto-submit when time limit is reached
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.prevent_copy_paste}
              onChange={(e) => updateSetting('prevent_copy_paste', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Disable copy/paste during assessment
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.require_fullscreen}
              onChange={(e) => updateSetting('require_fullscreen', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Require fullscreen mode during assessment
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.webcam_monitoring}
              onChange={(e) => updateSetting('webcam_monitoring', e.target.checked)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-3 text-sm text-gray-700">
              Enable webcam monitoring (proctoring)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSettings;
