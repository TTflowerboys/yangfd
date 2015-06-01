//
//  CUTECountry.h
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Mantle.h>

@interface CUTECountry : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *name;

@property (strong, nonatomic) NSString *countryCodeAndName;

@property (strong, nonatomic) NSString *code;

@property (nonatomic) BOOL showCountryCode;


@end
