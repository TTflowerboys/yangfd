//
//  CUTEModelEditingListener.h
//  currant
//
//  Created by Foster Yin on 6/11/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <MTLModel.h>
#import <MTLJSONAdapter.h>

@protocol CUTEModelEditingListenerDelegate <NSObject>

- (id)paramValueForKey:(NSString *)key withValue:(id)value;

@end

@interface CUTEModelEditingListener : NSObject

+ (CUTEModelEditingListener *)createListenerAndStartListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer;

- (void)startListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer;

- (void)stopListenMark;

- (NSDictionary *)getEditedParams;

@property (nonatomic, readonly) MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *sayer;

@end
