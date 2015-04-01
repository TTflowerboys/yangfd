//
//  CUTERentPriceForm.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEForm.h"

@interface CUTERentPriceForm : CUTEForm

@property (strong, nonatomic) NSString *currency;
@property (strong, nonatomic) NSString *deposit;
@property (strong, nonatomic) NSString *rentPrice;
@property (nonatomic) BOOL containBill;
@property (nonatomic) BOOL needSetDuration;

@end
