//
//  CUTEUserEditingListener.m
//  currant
//
//  Created by Foster Yin on 6/12/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUserEditingListener.h"

@implementation CUTEUserEditingListener

+ (CUTEUserEditingListener *)createListenerAndStartListenMarkWithSayer:(MTLModel<MTLJSONSerializing, CUTEModelEditingListenerDelegate> *)sayer {
    CUTEUserEditingListener *listener = [CUTEUserEditingListener new];
    [listener startListenMarkWithSayer:sayer];
    return listener;
}


@end
