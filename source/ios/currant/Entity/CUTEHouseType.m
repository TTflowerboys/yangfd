//
//  CUTEHouseType.m
//  currant
//
//  Created by Foster Yin on 5/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEHouseType.h"
#import "NSValueTransformer+MTLPredefinedTransformerAdditions.h"

@implementation CUTEHouseType

+ (NSDictionary *)JSONKeyPathsByPropertyKey
{
    return @{@"totalPrice": @"total_price",
             @"totalPriceMin": @"total_price_min",
             @"unitPrice": @"unit_price"};
}

+ (NSValueTransformer *)totalPriceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)totalPriceMinJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}

+ (NSValueTransformer *)unitPriceJSONTransformer
{
    return [NSValueTransformer mtl_JSONDictionaryTransformerWithModelClass:[CUTECurrency class]];
}


@end
