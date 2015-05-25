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

@property (strong, nonatomic) NSString *country;

@property (strong, nonatomic) NSString  *identifier;

@property (strong, nonatomic) NSString *name;

@property (strong, nonatomic) NSString *admin1;



@end
