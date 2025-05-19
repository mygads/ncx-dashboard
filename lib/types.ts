export type AMData = {
  name: string
  total: number
  failed: number
  provisionStart: number
  provisionDesign: number
  provisionIssued: number
  inProgressTotal: number
  pendingBASO: number
  pendingBillFulfill: number
  pendingBillApproval: number
  complete: number
  cancelAbandoned: number
  achPercentage: number
  rank: number
}

export type InsightData = {
  date: string
  insightUnit: string
  insightInputer: string
  insightAM: string
  insightTipeOrder: string
  insightBranch: string
  insightUmurOrder: string
}

export type ProgressType = {
  COMPLETE: number
  "IN PROGRESS": number
  "PENDING BASO": number
  "PENDING BILLING APROVAL": number
}
