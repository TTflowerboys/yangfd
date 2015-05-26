//
//  CUTEUser.h
//  currant
//
//  Created by Foster Yin on 4/9/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "MTLModel.h"
#import <MTLJSONAdapter.h>
#import "CUTEEnum.h"
#import "CUTECountry.h"

#define kUserRoleAdmin @"admin"
#define kUserRoleSales @"sales"
#define kUserRoleBetaRenting @"beta_renting"

@interface CUTEUser : MTLModel <MTLJSONSerializing>

@property (strong, nonatomic) NSString *identifier;

@property (strong, nonatomic) NSString *nickname;

@property (strong, nonatomic) CUTECountry *country;

@property (strong, nonatomic) NSString *countryCode;

@property (strong, nonatomic) NSString *phone;

@property (strong, nonatomic) NSString *email;

@property (strong, nonatomic) NSArray *roles;

- (BOOL)hasRole:(NSString *)role;

- (NSDictionary *)toParams;


@end
