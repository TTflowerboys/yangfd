//
//  CUTEDataManager.h
//  currant
//
//  Created by Foster Yin on 3/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "CUTEProperty.h"

@interface CUTEDataManager : NSObject

+ (instancetype)sharedInstance;

- (BOOL)isUserLoggedIn;

- (void)saveAllCookies;

- (void)cleanAllCookies;

- (void)restoreAllCookies;

- (void)pushRentProperty:(CUTEProperty *)property;

- (CUTEProperty *)popRentProperty;

- (CUTEProperty *)currentRentProperty;

@end
