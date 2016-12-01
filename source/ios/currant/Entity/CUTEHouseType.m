//
//  CUTEHouseType.m
//  currant
//
//  Created by Foster Yin on 5/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEHouseType.h"
#import <MTLJSONAdapter.h>

@implementation CUTEHouseType

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"totalPrice": @"total_price",
             @"totalPriceMin": @"total_price_min",
             @"unitPrice": @"unit_price"};
}

+ (NSValueTransformer *)totalPriceJSONTransformer
{
    return [MTLJSONAdapter dictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)totalPriceMinJSONTransformer
{
    return [MTLJSONAdapter dictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)unitPriceJSONTransformer
{
    return [MTLJSONAdapter dictionaryTransformerWithModelClass:[CUTECurrency class]];
}


@end
