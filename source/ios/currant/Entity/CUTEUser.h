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
#import "CUTEModelEditingListener.h"

#define kUserRoleAdmin @"admin"
#define kUserRoleSales @"sales"
#define kUserRoleBetaRenting @"beta_renting"

@interface CUTEUser : MTLModel <MTLJSONSerializing, CUTEModelEditingListenerDelegate>

@property (nullable, strong, nonatomic) NSString *identifier;

@property (nonnull, strong, nonatomic) NSString *nickname;

@property (nullable, strong, nonatomic) CUTECountry *country;

@property (nullable, strong, nonatomic) NSNumber *countryCode;

@property (nullable, strong, nonatomic) NSString *phone;

@property (nullable, strong, nonatomic) NSString *email;

@property (nullable, strong, nonatomic) NSString *wechat;

@property (nullable, strong, nonatomic) NSNumber *phoneVerified;

@property (nullable, strong, nonatomic) NSArray *privateContactMethods;

@property (nullable, strong, nonatomic) NSArray *roles;

@property (nullable, strong, nonatomic) NSArray *userTypes;

@property (nullable, strong, nonatomic) NSArray *locales;


- (BOOL)hasRole:(NSString *__nonnull)role;

- (NSDictionary * __nonnull)toParams;


@end
