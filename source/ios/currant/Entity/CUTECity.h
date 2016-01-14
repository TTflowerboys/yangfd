//
//  CUTECity.h
//  currant
//
//  Created by Foster Yin on 5/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Mantle.h>
#import "CUTECountry.h"

@interface CUTECity : MTLModel <MTLJSONSerializing>

@property (nullable, strong, nonatomic) NSString *country;

@property (nonnull, strong, nonatomic) NSString  *identifier;

@property (nonnull, strong, nonatomic) NSString *name;

@property (nonnull, strong, nonatomic) NSString *admin1;



@end
