//
//  MemoryReporter.m
//  currant
//
//  Created by Foster Yin on 5/19/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#include <mach/mach.h>
#import <Foundation/Foundation.h>

vm_size_t GetUsedMemory(void) {
    struct task_basic_info info;
    mach_msg_type_number_t size = sizeof(info);
    kern_return_t kerr = task_info(mach_task_self(), TASK_BASIC_INFO, (task_info_t)&info, &size);
    return (kerr == KERN_SUCCESS) ? info.resident_size : 0; // size in bytes
}

vm_size_t GetFreeMemory(void) {
    mach_port_t host_port = mach_host_self();
    mach_msg_type_number_t host_size = sizeof(vm_statistics_data_t) / sizeof(integer_t);
    vm_size_t pagesize;
    vm_statistics_data_t vm_stat;

    host_page_size(host_port, &pagesize);
    (void) host_statistics(host_port, HOST_VM_INFO, (host_info_t)&vm_stat, &host_size);
    return vm_stat.free_count * pagesize;
}

NSString* GetMemUsage(long *usedMemory) {
    // compute memory usage and log if different by >= 100k
    static long prevMemUsage = 0;
    long curMemUsage = GetUsedMemory();
    long memUsageDiff = curMemUsage - prevMemUsage;

    if (memUsageDiff > 100000 || memUsageDiff < -100000) {
        prevMemUsage = curMemUsage;
        *usedMemory = curMemUsage;
        return [NSString stringWithFormat:@"Memory used %7.1f (%+5.0f), free %7.1f kb", curMemUsage/1000.0f, memUsageDiff/1000.0f, GetFreeMemory()/1000.0f];
    }

    return nil;
}
