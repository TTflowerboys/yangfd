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
@property (nonatomic) NSString *rentPrice;
@property (nonatomic) NSString *deposit;

@property (nonatomic) BOOL billCovered;


- (NSString *)currencySymbol;

@end
