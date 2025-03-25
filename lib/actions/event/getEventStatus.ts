export const  getEventStatus = (
    startDate: Date,
    endDate: Date
  ): 'Upcoming' | 'Ongoing' | 'Finished' => {
    const today = new Date()
  
    if (today < startDate) return 'Upcoming'
    if (today >= startDate && today <= endDate) return 'Ongoing'
    return 'Finished'
  }
  