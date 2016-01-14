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

@property (nullable, strong, nonatomic) CUTECurrency *totalPrice;

@property (nullable, strong, nonatomic) CUTECurrency *totalPriceMin;

@property (nullable, strong, nonatomic) CUTECurrency *unitPrice;

@end
