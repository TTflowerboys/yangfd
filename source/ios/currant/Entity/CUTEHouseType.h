//
//  CUTEHouseType.h
//  currant
//
//  Created by Foster Yin on 5/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"
#import "MTLJSONAdapter.h"
#import "CUTECurrency.h"

@interface CUTEHouseType : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) CUTECurrency *totalPrice;

@property (strong, nonatomic) CUTECurrency *totalPriceMin;

@property (strong, nonatomic) CUTECurrency *unitPrice;

@end
