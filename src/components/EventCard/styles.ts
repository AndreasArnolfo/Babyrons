import { StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, BorderRadius, FontSize } from '../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align top for timeline look
    backgroundColor: Colors.modern.surface,
    borderRadius: 24, // Chat bubble roundness
    padding: Spacing.md,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md,
    ...Colors.shadows.soft, // Soft colored shadow
    minHeight: 80,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14, // Squircle
    backgroundColor: Colors.modern.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    marginTop: 2, // Align with text
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  babyName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.modern.text,
    marginBottom: 2,
  },
  details: {
    fontSize: FontSize.sm,
    color: Colors.modern.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  timeContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingLeft: Spacing.sm,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.modern.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeSince: {
    fontSize: 10,
    color: '#A0AEC0', // Soft gray
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 251, 240, 0.8)', // Cream overlay
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(4px)', // Web support
  },
  modalContent: {
    backgroundColor: Colors.modern.surface,
    borderRadius: 32,
    padding: Spacing.xl,
    width: '85%',
    maxWidth: 400,
    ...Colors.shadows.glow,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.modern.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  timeInput: {
    borderWidth: 0,
    backgroundColor: '#FAF5FF', // Lavender tint
    borderRadius: 20,
    padding: Spacing.lg,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.modern.accent,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#EDF2F7',
  },
  cancelButtonText: {
    color: '#718096',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: Colors.modern.accent,
    ...Colors.shadows.soft,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  deleteIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deleteConfirmText: {
    fontSize: FontSize.md,
    color: Colors.modern.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 24,
    fontWeight: '600',
  },
  deleteWarningText: {
    fontSize: FontSize.sm,
    color: Colors.modern.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  deleteConfirmButton: {
    backgroundColor: '#FC8181', // Soft Red
    ...Colors.shadows.soft,
  },
  deleteConfirmButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  endSleepButton: {
    marginTop: 8,
    backgroundColor: '#FAF5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  endSleepButtonText: {
    fontSize: 11,
    color: '#805AD5',
    fontWeight: '700',
  },
  sectionTitleModal: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.modern.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  helperTextModal: {
    fontSize: FontSize.sm,
    color: Colors.modern.textSecondary,
    marginBottom: Spacing.sm,
  },
});

