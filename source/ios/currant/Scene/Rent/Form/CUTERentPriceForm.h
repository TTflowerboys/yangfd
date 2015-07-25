//
//  CUTERentPriceForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"
#import "CUTEEnum.h"
#import "CUTETimePeriod.h"
#import "CUTETicketForm.h"

@interface CUTERentPriceForm : CUTETicketForm

@property (strong, nonatomic) NSString *currency;
@property (nonatomic) float rentPrice;
@property (nonatomic) NSNumber *deposit;

@property (nonatomic) BOOL billCovered;
@property (nonatomic) BOOL needSetPeriod;
@property (strong, nonatomic) NSDate *rentAvailableTime;
@property (strong, nonatomic) NSDate *rentDeadlineTime;
@property (strong, nonatomic) CUTETimePeriod *minimumRentPeriod;

- (NSString *)currencySymbol;

@end
