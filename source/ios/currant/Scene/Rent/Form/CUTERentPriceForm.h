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

@interface CUTERentPriceForm : CUTEForm

@property (strong, nonatomic) NSString *currency;
@property (strong, nonatomic) CUTEEnum *depositType;
@property (nonatomic) float rentPrice;
@property (nonatomic) BOOL billCovered;
@property (nonatomic) BOOL needSetPeriod;
@property (strong, nonatomic) NSDate *rentAvailableTime;
@property (strong, nonatomic) NSDate *rentDeadlineTime;
@property (strong, nonatomic) CUTETimePeriod *minimumRentPeriod;

- (NSString *)currencySymbol;

- (void)setAllDepositTypes:(NSArray *)depositTypes;

@end
