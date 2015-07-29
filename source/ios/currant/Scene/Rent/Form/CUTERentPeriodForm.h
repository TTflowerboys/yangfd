//
//  CUTERentPeriodForm.h
//  currant
//
//  Created by Foster Yin on 7/29/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTETicketForm.h"

@interface CUTERentPeriodForm : CUTETicketForm

@property (nonatomic) BOOL needSetPeriod;
@property (strong, nonatomic) NSDate *rentAvailableTime;
@property (strong, nonatomic) NSDate *rentDeadlineTime;
@property (strong, nonatomic) CUTETimePeriod *minimumRentPeriod;

@end
