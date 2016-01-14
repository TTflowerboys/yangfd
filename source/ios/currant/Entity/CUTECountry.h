//
//  CUTECountry.h
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Mantle.h>

@interface CUTECountry : MTLModel <MTLJSONSerializing>

@property (nonnull, strong, nonatomic) NSString *name;

@property (nonnull, strong, nonatomic) NSNumber *countryCode; // 86

@property (nonnull, strong, nonatomic) NSString *ISOcountryCode; // CN

@property (nonatomic) BOOL showCountryCode;


@end
