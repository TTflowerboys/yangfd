//
//  CUTEModelEditing.h
//  currant
//
//  Created by Foster Yin on 6/11/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@protocol CUTEModelEditing <NSObject>

- (void)startListenMark;

- (void)stopListenMark;

- (void)markPropertyKeyUpdated:(NSString *)propertyKey;

- (void)markPropertyKeyDeleted:(NSString *)propertyKey;

- (NSDictionary *)toEditedParams;

- (NSDictionary *)toParams;

- (void)clearMarks;

@end
